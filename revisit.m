close all;
clear;123456

R0 = 20*1000; % slant range of closest approach (m)
Vr = 150;     % effective radar velocity (m/s)
c = 3e+8;     % light speed (m/s)

Fr = 60e+6;   % range sampling rate (Hz)
Tr = 2.5e-6;  % transmitted pulse duration (s)

f0 = 5.3e+9;  % radar center frequency (Hz);
Kr = 20e+12;  % range FM rate (Hz/sec);

lambda = c/f0;

eta_c = 0;

PRF = 100;

% time axes
Nr = 321;    % number of range samples
Na = 255;    % number of azimuth samples

tau = ((0:Nr-1) - (Nr-1)/2) / Fr ; % shift the receiving window by 2*R0/c

%tau = linspace(-Nr/(2*Fr), Nr/(2*Fr), Nr) + 2*R0/c;


eta = linspace(-1.27, 1.27, Na);  % azimuth time referenced to closest approach (s)
                                  % This implies the target is in the
                                  % middle along the azimuth direction
                                

% envelopes
wr = @(x) double(abs(x) < (Tr/2)); % simple rectangular range window

wa = @(x) sinc(x).^2;            % azimuth envelope (sinc-squared)

% instantaneous slant range
R = @(eta) sqrt(R0^2 + (Vr * eta).^2); 

s0 = zeros(Na, Nr);

for ii = 1:Na
    
    Ri = R(eta(ii));          % instantaneous slant range
    range_arg = tau - 2*(Ri-R0)/c; %;  precision concern

    s0(ii,:) = wr(range_arg) .* ...
        wa(eta(ii) - eta_c) .* ...
        exp(-1j*4*pi*f0*Ri/c) .* ...
        exp(1j*pi*(Kr) .* (range_arg).^2);

    dd = wr(range_arg);

end

tau_ref = ((0:Nr-1) - (Nr-1)/2) / Fr;


tt = -Tr/2 : 1/Fr : Tr/2; % the same as tau_ref(86:236);

ref_chirp = exp(1j * pi * Kr * tt.^2);

ref_chirp = ref_chirp(2:150); % remove the beginning and the end

G = conj((fft(ref_chirp, Nr))); % zero padding
S = fft(s0, [], 2); 


S_filtered = G .*S;
s_range_compressed = ifft(S_filtered, [], 2);

% azimuth fourier transform

rgc_dopp = (fft(s_range_compressed, [], 1));


fdopp = (0:Na-1)'/Na*PRF;  % Na x 1 vector
% -PRF/2 <= f_doppler < PRF/2
% PRF is the upper bound of the azimuth frequency axis


idx_wrap = fdopp>=PRF/2;
fdopp(idx_wrap) = fdopp(idx_wrap) - PRF;

dopp_R = -2*Vr^2/lambda/R0; % Doppler rate

slc = ifft(rgc_dopp.*exp(1j*pi*fdopp.^2/dopp_R));

imagesc(1:Nr, 1:Na, abs(slc));
colorbar;
colormap jet;



%{
subplot(1,2,1);
imagesc(1:Nr, 1:Na, abs(s0)); 
xlabel("Range (samples)");
ylabel("Azimuth (samples)");
title("Magnitude");
colorbar;
colormap jet;

subplot(1,2,2);
imagesc(1:Nr, 1:Na, abs(s_range_compressed)); 
xlabel("Range (samples)");
ylabel("Azimuth (samples)");
title("Magnitude");
colorbar;
colormap jet;

sgtitle("Time domain characteristics of single point target");
%}
